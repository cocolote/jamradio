class RadiosController < ApplicationController
  respond_to :json, :html
  before_action :authenticate_user!, only: [:index]

  def index
    jams_songs = current_user.jams.map { |j| [j.name, j.id] }.compact
    guest_jams_songs = Guest.where(user: current_user).map { |g| [g.jam.name, g.jam.id] if g.jam }.compact
    @all_jams = jams_songs + guest_jams_songs

    respond_to do |format|
      format.html { @radio = Radio.new
                    @jam = Jam.new }
      format.json { render json: { radios: current_user.radios } }
    end
  end

  def create
    @radio = Radio.find_or_create_by(radio_params)
    @user_radio = UserRadio.new(user: current_user, radio: @radio)
    if @user_radio.save
      respond_to do |format|
        format.json { render json: @radio }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: @user_radio.errors.full_messages }, status: 403 }
      end
    end
  end

  def destroy
    UserRadio.destroy_all(user: current_user, radio_id: params[:id])
    respond_to do |format|
      format.json { render json: { id: params[:id], message: "The radio was deleted" } }
    end
  end

  protected

  def radio_params
    params.require(:radio).permit(:category, :name)
  end
end
