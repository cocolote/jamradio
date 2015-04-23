class JamsController < ApplicationController
  respond_to :json

  def index
    binding.pry
    guest_jams = Guest.where(user: current_user).map{ |g| g.jam }
    respond_to do |format|
      format.json { render json: { jams: { jams: current_user.jams,
                                           user: current_user,
                                           guest_jams: guest_jams,
                                           guest_users: guest_jams.map{ |j| j.user }
                                         }
                                  }
                  }
    end
  end

  def create
    @jam = Jam.new(jam_params)
    @jam.user = current_user
    if @jam.save
      params[:jam][:guests].each do |guest_id|
        user_guest = User.find(guest_id)
        Guest.create!(jam: @jam, user: user_guest)
      end
      respond_to do |format|
        format.json { render json: @jam }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: @jam.errors.full_messages }, status: 403 }
      end
    end
  end

  # def destroy
  #   # UserRadio.destroy_all(user: current_user, radio_id: params[:id])
  #   # respond_to do |format|
  #   #   format.json { render json: { id: params[:id], message: "The radio was deleted" } }
  #   # end
  # end
  protected

  def jam_params
    params.require(:jam).permit(:name)
  end
end
