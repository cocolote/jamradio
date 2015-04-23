class JamSongsController < ApplicationController
  respond_to :json

  # def index
  #   respond_to do |format|
  #     format.json { render json: { songs: current_user.songs.order("updated_at") } }
  #   end
  # end

  def create
    binding.pry
    @song = Song.find_or_create_by(song_params)
    @jam = Jam.find(params[:id])
    @jam_song = JamSong.new(jam: @jam, song: @song)
    if @jam_song.save
      respond_to do |format|
        format.json { render json: { message: "Song added to #{@jam.name} jam" } }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: @jam_song.errors.full_messages }, status: 403 }
      end
    end
  end

  def destroy
    @jam_song = UserSong.find_by(user: current_user, song_id: params[:id])
    UserSong.destroy_all(user: current_user, song_id: params[:id])
    respond_to do |format|
      format.json { render json: { id: params[:id], message: "The song was deleted" } }
    end
  end

  protected

  def song_params
    params.require(:song).permit(:sc_song_id, :title, :duration)
  end
end
